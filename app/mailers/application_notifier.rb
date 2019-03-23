class ApplicationNotifier < ApplicationMailer
  ADMIN_EMAIL = "gulati8@gmail.com"

  def send_error_notification(exception:)
    @exception = exception
    mail(to: ADMIN_EMAIL, subject: "OOPS! An error occurred uploading a media")
  end

  def send_approval_notification(media: Media.new)
    return unless media.uploaded_by_email.present?
    @media = media
    mail(to: @media.uploaded_by_email, subject: "Thanks #{@media.uploaded_by_name}!")
  end
end
