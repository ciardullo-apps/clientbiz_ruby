require 'sinatra'
require 'sinatra/activerecord'

ActiveRecord::Base.establish_connection(
  :adapter  => "mysql2",
  :host     => "localhost",
  :username => "john",
  :password => "test",
  :database => "clientbiz"
)

class Clientele < ActiveRecord::Base
  self.table_name = "clientele"
end

class App < Sinatra::Application
end

get '/' do
  # @clients = Clientele.all
  @clients = Clientele.order(firstresponse: :desc, firstname: :asc, lastname: :asc)
  erb :clients
end

get '/client/:clientId' do
  clientData = Clientele.find(params[:clientId])
  { :client => clientData }.to_json
end
