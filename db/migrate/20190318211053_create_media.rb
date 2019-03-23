class CreateMedia < ActiveRecord::Migration[5.2]
  def change
    create_table :media do |t|
      t.string  :event_name
      t.string  :uploaded_by_name
      t.string  :uploaded_by_email
      t.boolean :display_uploaded_by
      t.string  :caption
      t.integer :display_order
      t.boolean :approved
      t.timestamps
    end
  end
end
