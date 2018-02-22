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
  @clients = ClientView.order(lastapptyearmonth: :desc, numappts: :desc)
  @topics = Topic.order(id: :asc);
  @appointments = {}

  erb :"client-list", :layout => false, :content_type => "text/html", :status => 200
end

get '/client/:clientId' do
  content_type :json
  clientData = Clientele.find(params[:clientId])
  @clientSelected = true
  { :client => clientData }.to_json
end

get '/appointments/:clientId' do
  @topics = Topic.order(id: :asc);
  @appointments = Appointment.where("client_id = ?", params[:clientId])
  @client = Clientele.find(params[:clientId])

  erb :"appointment-list", :layout => false, :content_type => "text/html", :status => 200
  # { :appointments => appointmentData }.to_json
end

get '/newAppointment' do
  @clients = ClientView.order(lastapptyearmonth: :desc, numappts: :desc)
  @topics = Topic.order(id: :asc);

  # Advance to next hour
  @formData = { }
  @formData['nextHour'] = Time.new.change(min: 0).advance(hours: 1).iso8601.slice(0,16)
  @formData['duration'] = 60
  @formData['rate'] = 60
  @formData['billingpct'] = 0.75

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

get '/receivables' do
  @receivables = Appointment.select("clientele.firstname, clientele.lastname, topic.name as topicname, #{Appointment.table_name}.*").joins(:clientele).joins(:topic).where('paid is null')
  @paiddate = Time.new.iso8601.slice(0,10)

  erb :"receivables", :layout => false, :content_type => "text/html", :status => 200
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
  { :rowsAffected => 1 }.to_json
end

get '/newClient' do
  @topics = Topic.order(id: :asc);

  @formData = { }
  @formData['topicId'] = 2
  @formData['firstcontact'] = Time.new.change(min: 0).advance(hours: 1).iso8601.slice(0,16)
  @formData['firstresponse'] = @formData['firstcontact']
  @formData['solicited'] = 1

  erb :"create-client", :layout => false, :content_type => "text/html", :status => 200
  # { :appointments => appointmentData }.to_json
end

post '/saveClient' do
  # process the params however you want
  puts params
  # # Sinatra uses splat and captures for more complicated routes, remove from params hash
  params.delete('captures')
  topicId = params['topic_id'];
  params.delete('topic_id')
  clientId = 0

  ActiveRecord::Base.transaction do
    newClient = Clientele.create(params)
    clientId = newClient.id
    newClientTopic = ClientTopic.create( { 'client_id' => clientId, 'topic_id' => topicId })
  end

  status 200
  content_type 'application/json'
  { :clientId => clientId }.to_json
end
