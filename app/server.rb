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
  content_type :json
  receivablesData = Appointment.select("clientele.firstname, clientele.lastname, topic.name as topicname, #{Appointment.table_name}.*").joins(:clientele).joins(:topic).where('paid is null')
  { :receivables => receivablesData }.to_json
end

post '/updateAppointment' do
  # process the params however you want
  puts params
  # Sinatra uses splat and captures for more complicated routes, remove from params hash
  params.delete('captures')

  content_type :json
  appointment = Appointment.find(params[:id])
  appointment.paid = params[:paid]
  appointment.save

  status 200
  content_type 'application/json'
  { :rowsAffected => 1 }.to_json
end
