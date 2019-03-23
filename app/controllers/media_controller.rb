class MediaController < ApplicationController

  PERMITTED_PARAMS = [
    :event_name,
    :uploaded_by_name,
    :uploaded_by_email,
    :display_uploaded_by,
    :caption,
    :attachment,
  ].freeze

  MEDIA_PARAMS = [
    :attachment,
    :caption
  ].freeze

  class MissingMediaError < StandardError
    def message
      "Please upload a photo or video"
    end
  end

  before_action :store_form_vars,     only: [:create]
  before_action :reset_session_vars,  only: [:new]

  def index
    @media = Media.next_approved
  end

  def show
  end

  def create
    begin
      check_for_media
      @media = Media.create!(media_params)
      handle_success
    rescue => e
      handle_error(e)
    ensure
      redirect_to new_medium_path
    end
  end

  def new
    @media = Media.new(session[:media])
  end

  private

  def media_params
    params
      .require(:media)
      .permit(*PERMITTED_PARAMS)
  end

  def check_for_media
    raise MissingMediaError unless media_params[:attachment].present?
  end

  def store_form_vars
    session[:media] = media_params
  end

  def reset_session_vars
    if params[:reset]
      session.delete(:media)
      params.delete(:reset)
      redirect_to new_medium_path
    end
  end

  def handle_success
    flash[:success] = "Thanks so much! We'll add your media to our album real soon. Please share more if you have them!"
    session[:media] = session[:media].reject { |k| MEDIA_PARAMS.include?(k) || MEDIA_PARAMS.include?(k.to_sym) }
  end

  def handle_error(exception)
    flash[:alert] = exception.message
    ApplicationNotifier.send_error_notification(exception: exception).deliver
  end
end
