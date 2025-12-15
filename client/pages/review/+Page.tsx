import React, { useState, useEffect } from "react";
import { useData } from "vike-react/useData";
import { Data } from "./+data";
import { Star, Check, AlertCircle, MessageSquare } from "lucide-react";
import { AssmacAPI } from "@/lib/assmac_client";

interface ReviewData {
  order_id: string;
  name: string;
  stars: number | null;
  content: string | null;
}

export default function Page() {
  const data = useData<Data>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maxChars = 500;

  useEffect(() => {
    // Fetch review data
    const fetchReview = async () => {
      try {
        const response = await new AssmacAPI().getReview(data.token);
        if ("error" in response) {
          throw new Error(response.error);
        }
        setReviewData(response);
        setName(response.name || "");
        if (response.stars && response.stars > 0) {
          setRating(response.stars);
        }
        if (response.content) {
          setComment(response.content);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReview();
  }, [data.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }

    if (comment.trim().length === 0) {
      setError("Veuillez ajouter un commentaire");
      return;
    }

    if (comment.length > maxChars) {
      setError(`Le commentaire ne peut pas dépasser ${maxChars} caractères`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await new AssmacAPI().submitReview(
        data.token,
        rating,
        comment,
        name.trim() || undefined,
      );

      if ("error" in response) {
        const errorMsg = response.details
          ? `${response.error}: ${response.details.join(", ")}`
          : response.error;
        throw new Error(errorMsg);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </main>
    );
  }

  if (error && !reviewData) {
    return (
      <main className="min-h-screen flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Erreur</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
            >
              Retour à la boutique
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-screen-lg w-full px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-8">
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-700" />
              </div>

              <h1 className="text-3xl font-bold text-emerald-700 mb-3">
                Merci pour votre avis !
              </h1>

              <p className="text-lg text-gray-600 max-w-xl">
                Votre avis a été soumis avec succès. Il sera publié après
                validation par notre équipe.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Récapitulatif de votre avis
              </h2>

              <div className="space-y-4 text-gray-600">
                <div className="flex items-start space-x-3">
                  <Star className="flex-shrink-0 mt-1 text-yellow-400 fill-yellow-400" />
                  <div>
                    <p className="font-medium">Votre note</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageSquare className="flex-shrink-0 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium">Votre commentaire</p>
                    <p className="text-sm italic mt-1">"{comment}"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-gray-600 mb-6">
                Merci d'avoir pris le temps de partager votre expérience avec
                nous !
              </p>

              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition duration-200"
              >
                Retour à la boutique
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex-grow flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-2xl w-full px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Merci pour votre commande !
            </h1>
            <p className="text-lg text-gray-600">
              Commande{" "}
              <span className="font-semibold">#{reviewData?.order_id}</span>
            </p>
            <p className="text-gray-600 mt-2">
              Votre avis nous aide à améliorer nos produits et services
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Section */}
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-semibold text-gray-800 mb-3"
              >
                Votre nom (optionnel)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom affiché avec votre avis"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Laissez vide pour utiliser le nom de votre commande
              </p>
            </div>

            {/* Rating Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Quelle note donneriez-vous à votre expérience ?
              </label>
              <div className="flex gap-2 justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
                  >
                    <Star
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2 text-center sm:text-left">
                  Vous avez sélectionné {rating} étoile{rating > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Comment Section */}
            <div>
              <label
                htmlFor="comment"
                className="block text-lg font-semibold text-gray-800 mb-3"
              >
                Partagez votre expérience
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dites-nous ce que vous avez pensé de votre commande..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={6}
                maxLength={maxChars}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Maximum {maxChars} caractères
                </p>
                <p
                  className={`text-sm ${
                    comment.length >= maxChars
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {comment.length}/{maxChars}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  submitting || rating === 0 || comment.trim().length === 0
                }
                className="w-full px-8 py-4 bg-emerald-700 text-white text-lg font-semibold rounded-lg hover:bg-emerald-800 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  "Envoyer mon avis"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
