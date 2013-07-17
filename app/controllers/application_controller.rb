class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :admin_check, :user_last_seen
  
  def admin_check
    if user_signed_in? and current_user.admin?
      Rack::MiniProfiler.authorize_request
    end
  end
  
  def user_last_seen
    if user_signed_in?
      $redis.hset("user_last_seen", current_user.id.to_s, Time.now.to_i)
    end
  end

  def forem_user; current_user; end
  helper_method :forem_user

  def hide_cover_image
    @hide_cover_image = true
  end

  def mixpanel
    @mixpanel ||= Mixpanel::Tracker.new '92b66301c752642b40ca39e718517d94', { :async => true, :env => request.env }
  end

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || "/dashboard"
  end
  
  def after_sign_out_path_for(resource)
    request.referrer
  end
end
