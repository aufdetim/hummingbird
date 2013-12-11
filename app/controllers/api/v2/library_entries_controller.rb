module Api::V2
  class LibraryEntriesController < ApiController
    before_filter :authenticate_user!

    def create
      anime = Anime.find params[:library_entry][:anime_id]
      return error!("unknown anime id", 404) if anime.nil?

      library_entry = LibraryEntry.where(user_id: current_user.id,
                                         anime_id: anime.id).first
      return error!("library entry already exists", 406) unless library_entry.nil?

      library_entry = LibraryEntry.new({
        user_id: current_user.id,
        anime_id: anime.id,
        status: params[:library_entry][:status]
      })

      begin
        library_entry.save!
        render json: library_entry
      rescue
        return error!(library_entry.errors.full_messages * ', ', 500)
      end
    end

    def update
      library_entry = LibraryEntry.find params[:id]
      return error!("unauthorized", 403) if library_entry.user != current_user

      library_entry.status = params[:library_entry][:status]

      ## TEMPORARY -- Change when favorite status is moved into the library
      #               entry model.
      favorite_status = params[:library_entry][:is_favorite]
      anime = library_entry.anime
      if favorite_status and !current_user.has_favorite?(anime)
        # Add favorite.
        Favorite.create(user: current_user, item: anime)
      elsif current_user.has_favorite?(anime) and !favorite_status
        # Remove favorite.
        current_user.favorites.where(item_id: anime, item_type: "Anime").first.destroy
      end

      begin
        library_entry.save!
        render json: library_entry
      rescue
        return error!(library_entry.errors.full_messages * ', ', 500)
      end
    end
  end
end