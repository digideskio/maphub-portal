class Collection < ActiveRecord::Base
  
  belongs_to :user, :counter_cache => true
  has_and_belongs_to_many :maps
  
  validates_presence_of :title
  
end