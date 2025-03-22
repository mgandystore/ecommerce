class FillSettings < ActiveRecord::Migration[8.0]
  def up
    Setting.create(cgv: '', instagram: 'https://www.instagram.com/assmac_officiel/')
  end
end
