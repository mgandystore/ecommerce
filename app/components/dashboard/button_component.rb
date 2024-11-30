# frozen_string_literal: true

module Dashboard
  class ButtonComponent < ViewComponent::Base
    VARIANTS = {
      primary: "dash-btn-primary",
      secondary: "dash-btn-secondary",
      danger: "dash-btn-danger",
      minimal: "dash-link",
      minimal_danger: "dash-link-danger",
    }.freeze

    def initialize(
      text: nil,
      link: nil,
      icon_left: nil,
      icon_right: nil,
      variant: :primary,
      html_options: {}
    )
      @text = text
      @link = link
      @icon_left = icon_left
      @icon_right = icon_right
      @variant = variant
      @html_options = html_options
    end

    def call
      if @link
        link_to(@link, link_html_options) do
          button_content
        end
      else
        button_tag(button_html_options) do
          button_content
        end
      end
    end

    private

    def button_content
      content_tag(:span, class: "flex items-center gap-2") do
        safe_join([
                    icon_left_tag,
                    text_tag,
                    icon_right_tag
                  ].compact)
      end
    end

    def text_tag
      return unless @text
      content_tag(:span, @text)
    end

    def icon_left_tag
      return unless @icon_left
      inline_svg_tag(@icon_left, class: "h-4 w-4")
    end

    def icon_right_tag
      return unless @icon_right
      inline_svg_tag(@icon_right, class: "h-4 w-4")
    end

    def base_classes
      [
        VARIANTS[@variant.to_sym],
        "flex items-center"
      ].compact.join(" ")
    end

    def link_html_options
      @html_options.merge(
        class: [@html_options[:class], base_classes].compact.join(" ")
      )
    end

    def button_html_options
      @html_options.merge(
        type: "submit",
        class: [@html_options[:class], base_classes].compact.join(" ")
      )
    end

    def self.variant_primary
      "primary"
    end

    def self.variant_secondary
      "secondary"
    end

    def self.variant_danger
      "danger"
    end

    def self.variant_minimal
      "minimal"
    end

    def self.variant_minimal_danger
      "minimal_danger"
    end
  end
end