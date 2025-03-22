module Dashboard
  class SettingsController < BaseController
    def edit
      @settings = Setting.first
    end

    def update
      @settings = Setting.first
      if @settings.update(settings_params)
        flash[:success] = "Paramètres mis à jour avec succès"
        redirect_to edit_dashboard_settings_path
      else
        render :edit, status: :unprocessable_entity
      end
    end

    private

    def settings_params
      params.require(:setting).permit(:cgv, :instagram, :legal_notices, :address, :siret, :siren, :contact_mail)
    end
  end
end
