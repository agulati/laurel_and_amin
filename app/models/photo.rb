class Photo < ApplicationRecord
  has_one_attached :image

  after_initialize :enable_display_uploaded_by

  scope :approved,          -> { where(approved: true)      }
  scope :pending_approval,  -> { where(approved: false)     }
  scope :ordered,           -> { order(display_order: :asc, id: :asc) }

  def self.next_approved_id(current_approved_id: nil)
    next_approved = approved.ordered
    next_approved = next_approved.where("id > ?", current_approved_id) if current_approved_id
    next_approved = next_approved.first.try(:id)
  end

  private

  def enable_display_uploaded_by
    self.display_uploaded_by ||= true
  end
end
