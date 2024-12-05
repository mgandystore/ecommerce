module PositionableImages
  extend ActiveSupport::Concern

  def attach_images_with_positions(new_images, positions)
    return if new_images.blank?

    # Convert positions to hash if provided as JSON string
    positions = JSON.parse(positions, symbolize_names: true)
    update_images_positions(positions)

    ActiveRecord::Base.transaction do
      # Reorder old images positions
      reorder_old_images(positions)

      # Attach new images with positions
      new_attachments = new_images.filter { |image| image.is_a?(ActionDispatch::Http::UploadedFile) }.map do |image|
        # Find position for this image using filename
        position = positions.find { |pos| pos[:id] == image.original_filename }&.dig(:position)

        ActiveStorage::Blob.create_and_upload!(
          io: image,
          filename: image.original_filename,
          content_type: image.content_type,
          metadata: { position: position }
        )
      end

      images.attach(new_attachments)
    end
  end

  private def reorder_old_images(positions)
    return if positions.blank?

    positions.each do |position_data|
      next unless position_data[:new] == false
      image = images.
        joins(:blob).
        find(position_data[:id].to_i)
      next unless image

      image.blob.update!(
        metadata: image.blob.metadata.merge(
          "position" => position_data[:position].to_i
        )
      )

    end
  end

  def ordered_images
    images.sort_by { |img| img.blob.metadata["position"].to_i }
  end

  # image positions return an array of { id: image_id.to_s, position: position }
  def images_positions
    if images.empty?
      return []
    end

    images.map do |image|
      { id: image.id.to_s, position: image.blob.metadata["position"] }
    end
  end

  private def update_images_positions(image_positions = [])
    images.each do |image|
      image_positions.each_with_index do |image_position, index|
        if image_position[:new] == true && image.blob.filename.to_s == image_position[:id]
          image_positions[index].update(id: image.id.to_s)
        end
      end
    end
  end
end