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
end

class Appointment < ActiveRecord::Base
  self.table_name = "appointment"
end

class Topic < ActiveRecord::Base
  self.table_name = "topic"
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
