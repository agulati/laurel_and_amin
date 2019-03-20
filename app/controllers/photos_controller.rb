class PhotosController < ApplicationController

  PERMITTED_PARAMS = [
    :event_name,
    :uploaded_by_name,
    :uploaded_by_email,
    :display_uploaded_by,
    :image_title,
    :image,
  ].freeze

  IMAGE_PARAMS = [
    :image,
    :image_title
  ].freeze

  class MissingPhotoError < StandardError
    def message
      "Please upload an image file"
    end
  end

  before_action :store_form_vars, only: [:create]
  before_action :reset_session,   only: [:new]

  def index
    @photos = Photo.all
  end

  def show
  end

  def create
    begin
      check_for_image
      @photo = Photo.create!(photo_params)
      handle_success
    rescue => e
      handle_error(e)
    ensure
      redirect_to new_photo_path
    end
  end

  def new
    @photo = Photo.new(session[:photo])
  end

  private

  def photo_params
    params
      .require(:photo)
      .permit(*PERMITTED_PARAMS)
  end

  def check_for_image
    raise MissingPhotoError unless photo_params[:image].present?
  end

  def store_form_vars
    session[:photo] = photo_params
  end

  def reset_session
    if params[:reset]
      session.delete(:photo)
      params.delete(:reset)
      redirect_to new_photo_path
    end
  end

  def handle_success
    flash[:success] = "Thanks so much! We'll add your photo to our album real soon. Please share more if you have them!"
    session[:photo] = session[:photo].reject { |k| IMAGE_PARAMS.include?(k) || IMAGE_PARAMS.include?(k.to_sym) }
  end

  def handle_error(exception)
    flash[:alert] = "Oops, something went wrong - #{exception.message}"
    ApplicationNotifier.send_error_notification(exception: exception).deliver
  end
end
