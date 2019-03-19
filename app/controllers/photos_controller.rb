class PhotosController < ApplicationController

  before_action :store_form_vars, only: [:create]
  before_action :check_for_image, only: [:create]

  def index
  end

  def show
  end

  def create
    begin
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
      .permit(:uploaded_by_name, :uploaded_by_email, :display_uploaded_by, :image_title, :image)
  end

  def check_for_image
    raise "Please upload an image file" unless photo_params[:image].present?
  end

  def store_form_vars
    session[:photo] = photo_params
  end

  def handle_success
    flash[:success] = "Thanks so much! We'll add your photo to our album real soon."
    session[:photo].reject! { |k| [:image_title, :image].include?(k) }
  end

  def handle_error(exception)
    flash[:alert] = "Sorry, an error occurred saving your photo. Please try again."
    logger.error(exception.message, exception.backtrace.join("\n"))
    send_error_notification(exception: exception).deliver
  end
end
