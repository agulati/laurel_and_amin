class Media < ApplicationRecord
  has_one_attached :attachment

  after_initialize :enable_display_uploaded_by

  scope :approved,          -> { where(approved: true)  }
  scope :pending_approval,  -> { where(approved: false) }

  def self.next_approved
    first
  end

  def content_type
    attachment.content_type.split("/").first
  end

  private

  def enable_display_uploaded_by
    self.display_uploaded_by ||= true
  end
end
