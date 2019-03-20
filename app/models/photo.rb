class Photo < ApplicationRecord
  has_one_attached :image

  after_initialize :enable_display_uploaded_by

  scope :approved,          -> { where(approved: true)  }
  scope :pending_approval,  -> { where(approved: false) }

  private

  def enable_display_uploaded_by
    self.display_uploaded_by ||= true
  end
end
