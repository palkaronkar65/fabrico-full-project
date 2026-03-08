import React, { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const Tryon = ({ product, selectedVariant = 0, onVariantChange, onClose }) => {
  const [internalSelectedVariant, setInternalSelectedVariant] = useState(selectedVariant);
  const iframeRef = useRef(null);

  const handleVariantChange = (index) => {
    if (onVariantChange && typeof onVariantChange === "function") {
      onVariantChange(index);
    } else {
      setInternalSelectedVariant(index);
    }
  };

  const currentVariantIndex = onVariantChange ? selectedVariant : internalSelectedVariant;
  const currentVariant = product?.variants?.[currentVariantIndex] || {};
  const currentImage = currentVariant.images?.[0];

  // Send garment image to iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    const handleLoad = () => {
      if (currentImage && iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "LOAD_GARMENT",
            imageUrl: currentImage,
          },
          "*"
        );
      }
    };

    iframe?.addEventListener("load", handleLoad);

    if (currentImage && iframe?.contentWindow) {
      setTimeout(() => {
        iframe.contentWindow.postMessage(
          {
            type: "LOAD_GARMENT",
            imageUrl: currentImage,
          },
          "*"
        );
      }, 1000);
    }

    return () => iframe?.removeEventListener("load", handleLoad);
  }, [currentImage]);

  // Listen for messages FROM iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "REQUEST_GARMENT" && currentImage) {
        event.source.postMessage(
          {
            type: "GARMENT_IMAGE",
            imageUrl: currentImage,
          },
          event.origin
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentImage]);

  // Download image properly
  const handleDownloadCloth = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage, { mode: "cors" });
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cloth-${product?.name || "image"}.jpg`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download image. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Virtual Try-On</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            <FaTimes />
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SIDE - VARIANTS */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Try {product?.name}
              </h3>

              {/* Selected Cloth Preview */}
              {currentImage && (
                <div className="bg-gray-50 p-3 rounded-xl shadow-sm">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-48 object-contain rounded-lg"
                  />

                  <button
                    onClick={handleDownloadCloth}
                    className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Download Cloth Image
                  </button>
                </div>
              )}

              {/* Color Variants */}
              {product?.variants?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Select Color:</h4>

                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => handleVariantChange(index)}
                        disabled={variant.quantity <= 0}
                        className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                          currentVariantIndex === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        } ${variant.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: variant.color.toLowerCase() }}
                        />
                        <span className="text-xs mt-1 text-gray-700 capitalize">
                          {variant.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="lg:col-span-2 space-y-5">

              {/* INSTRUCTIONS */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Use Virtual Try-On</h3>

                <ol className="list-decimal ml-5 space-y-2 text-gray-700 text-sm leading-relaxed">
                  <li>Download the cloth image using the button on the left.</li>
                  <li>Upload your person photo inside the try-on tool below.</li>
                  <li>Upload the downloaded cloth image.</li>
                  <li>Click the <b>Generate</b> button inside the tool.</li>
                </ol>

                {/* WARNING */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  ⚠️ <b>Note:</b>  
                  Free HuggingFace servers may be slow or busy.  
                  If the output fails to generate, please try again after a few minutes.
                </div>
              </div>

              {/* IFRAME */}
              <div>
                <iframe
                  ref={iframeRef}
                  src="https://weshopai-weshopai-virtual-try-on.hf.space"
                  frameBorder="0"
                  width="100%"
                  height="470"
                  title="Virtual Try-On"
                  className="rounded-xl border shadow-sm w-full"
                />
              </div>
              {/* <div>
                <iframe
                  ref={iframeRef}
                  src="https://franciszzj-leffa.hf.space"
                  frameBorder="0"
                  width="100%"
                  height="470"
                  title="Virtual Try-On"
                  className="rounded-xl border shadow-sm w-full"
                />
              </div> */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tryon;
