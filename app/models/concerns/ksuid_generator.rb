module KsuidGenerator
  extend ActiveSupport::Concern

  included do
    before_create :gen_ksuid
  end

  private

  def gen_ksuid
    self.id = KSUID.new.to_s if id.nil?
  end
end
