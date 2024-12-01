class AttachmentsController < ApplicationController
  ALLOWED_ATTACHMENTS = {
    "Product" => %w[images],
    "ProductVariant" => %w[images]
  }.freeze

  MAX_QUALITY = 100
  MIN_QUALITY = 1
  DEFAULT_QUALITY = 80

  include ActiveStorage::Streaming

  def show
    attachment = ActiveStorage::Attachment.includes(:blob).find_by(id: params[:id], record_id: params[:record_id])
    if !attachment.blob || !ALLOWED_ATTACHMENTS[attachment.record_type]&.include?(attachment.name)
      return head :not_found
    end

    if transformation_params_present?
      variant = attachment.variant(transformation_options).processed
      variant_record = variant.send(:record)
      blob = variant_record.image.blob
      send_blob(blob)
    else
      send_blob(attachment.blob)
    end
  end

  private

  def send_blob(blob)
    if request.headers["Range"].present?
      send_blob_byte_range_data(blob, request.headers["Range"])
      return
    end

    http_cache_forever public: true do
      response.headers["Accept-Ranges"] = "bytes"
      response.headers["Content-Length"] = blob.byte_size.to_s

      send_blob_stream(blob, disposition: params[:disposition])
    end
  end

  def parse_dimension(param_value)
    return nil if param_value.blank?
    value = param_value.to_i
    value.positive? ? value : nil
  end

  def parse_quality(param_value)
    return DEFAULT_QUALITY if param_value.blank?

    quality = param_value.to_i
    if quality < MIN_QUALITY
      MIN_QUALITY
    elsif quality > MAX_QUALITY
      MAX_QUALITY
    else
      quality
    end
  end

  def transformation_options
    options = {}

    variant = params[:variant]
    if variant.present?
      return params[:variant].to_sym
    end

    width = parse_dimension(params[:resize_to_limit_width])
    height = parse_dimension(params[:resize_to_limit_height])

    if width || height
      options[:resize_to_limit] = [width, height]
    end

    quality = parse_quality(params[:quality])
    options[:quality] = quality if quality != DEFAULT_QUALITY

    options
  end

  def transformation_params_present?
    params[:resize_to_limit_width].present? ||
      params[:resize_to_limit_height].present? ||
      params[:quality].present? || params[:variant].present?
  end
end