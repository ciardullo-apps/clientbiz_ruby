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

class App < Sinatra::Application
end

get '/' do
  # @clients = Clientele.all
  @clients = Clientele.order(firstresponse: :desc, firstname: :asc, lastname: :asc)
  @topics = Topic.order(id: :asc);
  @appointments = {}
  erb :clients
end

get '/client/:clientId' do
  content_type :json
  clientData = Clientele.find(params[:clientId])
  @clientSelected = true
  { :client => clientData }.to_json
end

get '/appointments/:clientId' do
  content_type :json
  appointmentData = Appointment.where("client_id = ?", params[:clientId])
  { :appointments => appointmentData }.to_json
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
