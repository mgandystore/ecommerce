require 'maxminddb'

Rails.application.config.after_initialize do
  Rails.application.config.maxmind_db = MaxMindDB.new(
    Rails.root.join('db', 'GeoLite2-City.mmdb')
  )
end
