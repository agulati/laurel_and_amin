class ApplicationNotifier < ApplicationMailer
  ADMIN_EMAIL = "gulati8@gmail.com"

  def send_error_notification(exception:)
    @exception = exception
    mail(to: ADMIN_EMAIL, subject: "OOPS! An error occurred uploading a photo")
  end

  def send_approval_notification(photo: Photo.new)
    return unless photo.uploaded_by_email.present?
    @photo = photo
    mail(to: @photo.uploaded_by_email, subject: "Thanks #{@photo.uploaded_by_name}!")
  end
end
