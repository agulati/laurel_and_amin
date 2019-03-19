class CreatePhotos < ActiveRecord::Migration[5.2]
  def change
    create_table :photos do |t|
      t.string  :event_name
      t.string  :uploaded_by_name
      t.string  :uploaded_by_email
      t.boolean :display_uploaded_by
      t.string  :image_title
      t.text    :comments
      t.boolean :approved
      t.timestamps
    end
  end
end
