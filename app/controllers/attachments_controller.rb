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
    cache_key = "blob/#{request.url}"

    blob = Rails.cache.fetch(cache_key, expires_in: 1.week) do
      attachment = ActiveStorage::Attachment.includes(:blob).find_by(id: params[:id], record_id: params[:record_id])
      return nil unless attachment&.blob && ALLOWED_ATTACHMENTS[attachment.record_type]&.include?(attachment.name)

      if transformation_params_present?
        variant = attachment.variant(transformation_options).processed
        variant_record = variant.send(:record)
        variant_record.image.blob
      else
        attachment.blob
      end
    end

    return head :not_found unless blob
    send_blob(blob)
  end

  private

  def send_blob(blob)
    # Set longer cache control headers for better client-side caching
    response.headers["Cache-Control"] = "public, max-age=#{1.year.to_i}"
    response.headers["ETag"] = blob.checksum
    response.headers["Accept-Ranges"] = "bytes"

    # Use conditional GET to avoid unnecessary transfers
    if stale?(etag: blob.checksum, public: true)
      begin
        # Get short-lived presigned URL
        uri = URI.parse(blob.url(expires_in: 5.minutes))

        # Use persistent connections
        Net::HTTP.start(uri.host, uri.port,
                        use_ssl: uri.scheme == "https",
                        pool_size: 5,
                        read_timeout: 10,
                        open_timeout: 5) do |http|
          net_request = Net::HTTP::Get.new(uri)

          # Support range requests for large files
          if request.headers["Range"]
            net_request["Range"] = request.headers["Range"]
          end

          # Stream the response in chunks to reduce memory usage
          http.request(net_request) do |blob_response|
            response.headers["Content-Type"] = blob_response.content_type
            response.headers["Content-Length"] = blob_response.content_length

            if blob_response.code == "206" # Partial content
              response.headers["Content-Range"] = blob_response["Content-Range"]
              response.status = 206
            end

            # Set content disposition based on file type
            disposition = content_type_requires_download?(blob_response.content_type) ? "attachment" : "inline"
            response.headers["Content-Disposition"] = disposition

            # Stream in chunks instead of reading entire body
            blob_response.read_body do |chunk|
              response.stream.write(chunk)
            rescue IOError => e
              # Handle closed stream gracefully
              logger.info "Stream closed by client: #{e.message}"
              break
            end
          end
        end
      rescue StandardError => e
        logger.error "Error proxying blob: #{e.message}"
        response.stream.close rescue nil
        raise
      ensure
        response.stream.close rescue nil
      end
    end
  end





  def content_type_requires_download?(content_type)
    dangerous_types = %w[application/octet-stream application/x-executable]
    dangerous_types.include?(content_type)
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
      options[:resize_to_limit] = [ width, height ]
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
