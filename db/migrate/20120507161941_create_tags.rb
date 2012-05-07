class CreateTags < ActiveRecord::Migration
  def change
    create_table :tags do |t|
      t.string :label
      t.string :dbpedia_uri
      t.integer :annotation_id
      t.timestamps
    end
  end
end
