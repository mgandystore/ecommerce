module Dashboard::OrdersHelper
  def statuses_text
    {
      "paid" => "Payée",
      "refunded" => "Remboursée",
      "shipped" => "Expédiée",
      "pending" => "En attente"
    }
  end

  def statuses_icon
    {
      "paid" => "icons/bank_note.svg",
      "refunded" => "icons/undo_2.svg",
      "shipped" => "icons/truck.svg",
      "pending" => "icons/hourglass.svg"
    }
  end

  def statuses_color
    {
      "paid" => "blue",
      "refunded" => "orange",
      "shipped" => "green",
      "pending" => "gray"
    }
  end

  def order_events(order)
    events = [
      {
        date: order.created_at,
        text: "Commande en attente",
        status: "pending"
      },
      {
        date: order.paid_at,
        text: "Commande payée",
        status: "paid"
      },
      {
        date: order.shipped_at,
        text: "Commande expédiée",
        status: "shipped"
      },
      {
        date: order.refunded_at, # Changed from paid_at to refunded_at
        text: "Commande remboursée",
        status: "refunded"
      }
    ]

    events.reject { |event| event[:date].nil? }
          .sort_by { |event| event[:date] }
  end

  def statuses_badge_color(status)
    "bg-#{statuses_color[status.to_s.downcase]}-100 text-#{statuses_color[status.to_s.downcase]}-800"
  end

  def statuses_for_select
    base = [["Tous les états", ""]]
    statuses_text.map { |status, text| [text, status] }
    base + statuses_text.map { |status, text| [text, status] }
  end
end
