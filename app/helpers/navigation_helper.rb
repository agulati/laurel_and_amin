module NavigationHelper
  def navigation_link(link)
    case link
    when :home
      if params[:action] == "index" && params[:event].blank?
        "<li class=\"menu-text\">Home</li>"
      else
        "<li>#{ link_to("Home", root_path) }</li>"
      end
    when :sangeet
      if params[:action] == "index" && params[:event] == "sangeet"
        "<li class=\"menu-text\">Sangeet</li>"
      else
        "<li>#{ link_to("Sangeet", root_path(event: "sangeet")) }</li>"
      end
    when :wedding
      if params[:action] == "index" && params[:event] == "wedding"
        "<li class=\"menu-text\">Wedding</li>"
      else
        "<li>#{ link_to("Wedding", root_path(event: "wedding")) }</li>"
      end
    when :share
      if params[:action] == "new"
        "<li class=\"menu-text\">Share</li>"
      else
        "<li>#{ link_to("Share", new_medium_path) }</li>"
      end
    end.html_safe
  end
end
