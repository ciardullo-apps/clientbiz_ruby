require 'sinatra'
require 'sinatra/activerecord'
require 'json'

ActiveRecord::Base.establish_connection(
  :adapter  => "mysql2",
  :host     => "localhost",
  :username => "john",
  :password => "test",
  :database => "clientbiz"
)

# Time.zone = "UTC"
ActiveRecord::Base.default_timezone = :local

class Clientele < ActiveRecord::Base
  self.table_name = "clientele"
  has_many :appointments, :foreign_key => "client_id"
end

class Appointment < ActiveRecord::Base
  self.table_name = "appointment"
  belongs_to :clientele, :foreign_key => "client_id"
  belongs_to :topic, :foreign_key => "topic_id"
end

# TODO Add route for topics
class Topic < ActiveRecord::Base
  self.table_name = "topic"
  has_many :appointments, :foreign_key => "topic_id"
end

class ClientView < ActiveRecord::Base
  self.table_name = "clientview"
  has_many :appointments, :foreign_key => "client_id"
end

class ClientTopic < ActiveRecord::Base
  self.table_name = "clienttopic"
  has_many :clientele, :foreign_key => "client_id"
  has_many :topic, :foreign_key => "topic_id"
end

class App < Sinatra::Application
end

get '/' do
  erb :layout
end

get '/client' do
  content_type 'application/json'
  sortColumn = params['sortColumn']
  sortOrder = params['sortOrder']

  # clientsData = ClientView.order(lastapptyearmonth: :desc, numappts: :desc)
  if sortColumn.to_s.empty? then
    sortColumn = 'lastapptdate'
  end

  if sortOrder.to_s.empty?
    sortOrder = 'desc'
  end

  puts sortColumn.class
  puts sortOrder.class
  clientsData = ClientView.order(sortColumn => sortOrder)
  clientsData.to_json # Convert ActiveRecord::Relation to JSON
end

get '/client.html' do
  status, headers, body = call env.merge(
    "PATH_INFO" => '/client'
  )

  @clients = JSON.parse(body[0])  # Add key :symbolize_names => true to convert keys from strings to symbols
  @topics = Topic.order(id: :asc);
  @appointments = {}

  erb :"client-list", :layout => false, :content_type => "text/html", :status => 200
end

get %r{/client/([\d]+).html} do
  status, headers, body = call env.merge(
    "PATH_INFO" => '/client/' + params[:captures].first
  )

  @formData = JSON.parse(body[0])
  @topics = Topic.order(id: :asc);
  erb :"edit-client", :layout => false, :content_type => "text/html", :status => 200
end

get '/client/:clientId' do
  content_type 'application/json'
  clientData = Clientele.find(params[:clientId])
  lastAppointment = Appointment
  .order("topic_id DESC")
    .where("client_id = :i", { i: params[:clientId] })
    .first()
  topicId = lastAppointment.topic_id
  puts("- - - - - GOT #{topicId}")
  clientData.as_json.merge(:topicId => topicId).to_json
end

get %r{/appointments/([\d]+).html} do
  status, headers, body = call env.merge(
    "PATH_INFO" => '/appointments/' + params[:captures].first
  )

  @appointments = JSON.parse(body[0])
  @topics = Topic.order(id: :asc);
  @client = Clientele.find(params[:captures].first)

  erb :"appointment-list", :layout => false, :content_type => "text/html", :status => 200
end

get '/appointments/:clientId' do
  content_type 'application/json'
  appointmentData = Appointment.where("client_id = ?", params[:clientId])
  appointmentData.to_json
end

get '/receivables.html' do
  status, headers, body = call env.merge(
    "PATH_INFO" => '/receivables'
  )
  @receivables = JSON.parse(body[0])
  @paiddate = Time.new.iso8601.slice(0,10)

  erb :"receivables", :layout => false, :content_type => "text/html", :status => 200
end

get '/receivables' do
  content_type 'application/json'
  receivables = Appointment.select("clientele.firstname, clientele.lastname, topic.name as topicname, #{Appointment.table_name}.*").joins(:clientele).joins(:topic).where('paid is null')
  receivables.to_json
end

get '/newAppointment' do
  @clients = ClientView.order(lastapptyearmonth: :desc, numappts: :desc)
  @topics = Topic.order(id: :asc);

  # Advance to next hour
  @formData = { }
  @formData['nextHour'] = Time.new.change(min: 0).advance(hours: 1).iso8601.slice(0,16)
  @formData['duration'] = 60
  @formData['rate'] = 60
  @formData['billingpct'] = 0.80

  # nextHour.setMinutes(0);
  # nextHour.setHours(nextHour.getHours() + 1);

  erb :"create-appointment", :layout => false, :content_type => "text/html", :status => 200
  # { :appointments => appointmentData }.to_json
end

post '/saveAppointment' do
  # process the params however you want
  puts params
  # Sinatra uses splat and captures for more complicated routes, remove from params hash
  params.delete('captures')

  newAppt = Appointment.create(params)
  status 200
  content_type 'application/json'
  { :appointmentId => newAppt.id }.to_json
end

post '/updatePaidDate' do
  # process the params however you want
  puts params
  # Sinatra uses splat and captures for more complicated routes, remove from params hash
  params.delete('captures')

  appointment = Appointment.find(params[:id])
  appointment.paid = params[:paid]
  appointment.save

  status :ok
  content_type :json
  { :updatedAppointmentId => appointment.id }.to_json
end

get '/newClient' do
  @topics = Topic.order(id: :asc);

  @formData = { }
  @formData['topicId'] = 2
  @formData['firstcontact'] = Time.new.change(min: 0).advance(hours: 1).iso8601.slice(0,16)
  @formData['firstresponse'] = @formData['firstcontact']
  @formData['solicited'] = 1

  erb :"edit-client", :layout => false, :content_type => "text/html", :status => 200
  # { :appointments => appointmentData }.to_json
end

post '/saveClient' do
  # process the params however you want
  puts params
  # # Sinatra uses splat and captures for more complicated routes, remove from params hash
  params.delete('captures')
  topicId = params['topic_id'];
  params.delete('topic_id')
  clientId = params['client_id']

  if clientId.empty? then
    ActiveRecord::Base.transaction do
      params.delete('client_id')
      newClient = Clientele.create(params)
      clientId = newClient.id
      newClientTopic = ClientTopic.create( { 'client_id' => clientId, 'topic_id' => topicId })
    end
  else
    ActiveRecord::Base.transaction do
      clientData = Clientele.find(clientId)
      clientData['firstname'] = params['firstname']
      clientData['lastname'] = params['lastname']
      clientData['contactname'] = (params['contactname'].empty? ? nil : params['contactname'])
      clientData['city'] = params['city']
      clientData['state'] = params['state']
      clientData['timezone'] = params['timezone']
      if params.key?("solicited")
        clientData['solicited'] = "true"
        clientData['firstcontact'] = params['firstcontact']
      else
        clientData['solicited'] = "false"
        clientData['firstcontact'] = nil
      end
      clientData['firstresponse'] = params['firstresponse']
      clientData.save!
    end
  end

  status 200
  content_type 'application/json'
  { :clientId => clientId }.to_json
end

get '/monthly-activity.html' do
  status, headers, body = call env.merge(
    "PATH_INFO" => '/monthlyActivity'
  )
  @reportData = JSON.parse(body[0])

  erb :"reports/monthly-activity", :layout => false, :content_type => "text/html", :status => 200
end

get '/monthlyActivity' do
  content_type 'application/json'
  sortColumn = params['sortColumn']
  sortOrder = params['sortOrder']

  # clientsData = ClientView.order(lastapptyearmonth: :desc, numappts: :desc)
  if sortColumn.to_s.empty? then
    sortColumn = 'monthOfYear'
  end

  if sortOrder.to_s.empty?
    sortOrder = 'desc'
  end

  puts sortColumn
  puts sortOrder
  reportData = Appointment
    .select("DATE_FORMAT(starttime, '%Y-%m-01') as monthOfYear, " +
      "COUNT(distinct client_id) as totalClients, " +
      "COUNT(*) as totalAppointments, " +
      "SUM(duration / 60) as totalHours, " +
      "SUM(rate * (duration / 60) * billingpct) as totalRevenue, " +
      "SUM(rate * (duration / 60) * billingpct)/ sum(duration / 60) as averageRate ")
    .group("DATE_FORMAT(starttime, '%Y-%m-01')")
    .order("#{sortColumn} #{sortOrder}")
    .as_json(:except => :id) # remove id from result set
  reportData.to_json # Convert ActiveRecord::Relation to JSON
end

get '/activity-year-month.html/:year/:month' do
  status, headers, body = call env.merge(
    "PATH_INFO" => "/activityYearMonth/#{params[:year]}/#{params[:month]}"
  )
  @reportData = JSON.parse(body[0])

  erb :"reports/activity-year-month", :layout => false, :content_type => "text/html", :status => 200
end

get '/activityYearMonth/:year/:month' do
  content_type 'application/json'
  sortColumn = params['sortColumn']
  sortOrder = params['sortOrder']

  # clientsData = ClientView.order(lastapptyearmonth: :desc, numappts: :desc)
  if sortColumn.to_s.empty? then
    sortColumn = 'id'
  end

  if sortOrder.to_s.empty?
    sortOrder = 'desc'
  end

  puts sortColumn
  puts sortOrder
  reportData = Appointment
    .select("clientele.firstname, clientele.lastname, topic.name as topicname, #{Appointment.table_name}.*")
    .joins(:clientele)
    .joins(:topic)
    .where('YEAR(starttime) = ? AND MONTH(starttime) = ?', params[:year], params[:month])
    .order("#{sortColumn} #{sortOrder}")
  reportData.to_json # Convert ActiveRecord::Relation to JSON
end
