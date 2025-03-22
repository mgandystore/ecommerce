class AugmentSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :settings, :legal_notices, :string, default: "Mentions légales..."
    add_column :settings, :address, :string, default: "RUE LOUIS GANEL 38090 VILLEFONTAINE"
    add_column :settings, :siret, :string, default: "941949372"
    add_column :settings, :siren, :string, default: "94194937200010"
    add_column :settings, :contact_mail, :string, default: "martin@assmac.com"
    add_column :settings, :shop_name, :string,  default: "La boutique du Assmac"
    add_column :settings, :short_desc, :string,  default: "Hamac léger pour la grande voie et les ascensions verticales"
    add_column :settings, :keywords, :string,  default: "hamac,grimpe,escalade,voie sportive,grande voie,confort,ultralight,materiel sportif"
    add_column :settings, :og, :string,  default: "{}"
    add_column :settings, :twitter, :string,  default: "{}"
  end
end
