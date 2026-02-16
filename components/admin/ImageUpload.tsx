"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import Cropper from "react-easy-crop";
import {
  Upload,
  X,
  Loader2,
  Crop,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  aspectRatio?: number;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });

const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180;
};

// Fonction améliorée pour créer l'image recadrée avec rotation
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: CroppedAreaPixels,
  rotation: number = 0,
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const rotRad = getRadianAngle(rotation);

  // Calculer la bounding box de l'image tournée
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const newWidth = image.width * cos + image.height * sin;
  const newHeight = image.width * sin + image.height * cos;

  // Créer un canvas pour l'image tournée
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Translater au centre et tourner
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Dessiner l'image
  ctx.drawImage(image, 0, 0);

  // Extraire la zone recadrée
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("No 2d context");
  }

  // Définir la taille du canvas final
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Dessiner la partie recadrée
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.95,
    );
  });
};

export default function ImageUpload({
  value,
  onChange,
  bucket = "desserts-images",
  aspectRatio = 4 / 3,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État pour le cropper
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedAreaPixels | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const optimizeImage = async (file: Blob): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/webp" as const,
    };
    return await imageCompression(file as File, options);
  };

  const uploadImage = async (blob: Blob): Promise<string> => {
    const supabase = createClient();

    // Optimize image
    const optimizedFile = await optimizeImage(blob);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}.webp`;

    console.log("📤 [Upload] Bucket:", bucket);
    console.log("📤 [Upload] Filename:", filename);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, optimizedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("📤 [Upload] Error:", error);
      throw error;
    }

    console.log("📤 [Upload] Success! Path saved:", data.path);
    return data.path;
  };

  const handleFileSelect = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsEditingExisting(false);

    // Lire le fichier et ouvrir le cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  }, []);

  // Éditer une image existante
  const handleEditExisting = () => {
    if (!value) return;

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${value}`;
    setImageToCrop(imageUrl);
    setIsEditingExisting(true);
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsUploading(true);
    setError(null);

    try {
      // Créer l'image recadrée avec rotation
      const croppedBlob = await createCroppedImage(
        imageToCrop,
        croppedAreaPixels,
        rotation,
      );

      // Supprimer l'ancienne image si on édite
      if (isEditingExisting && value) {
        const supabase = createClient();
        await supabase.storage.from(bucket).remove([value]);
      }

      // Upload l'image recadrée
      const path = await uploadImage(croppedBlob);
      onChange(path);

      // Fermer le cropper
      resetCropper();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  };

  const resetCropper = () => {
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setIsEditingExisting(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    disabled: isUploading || !!imageToCrop,
  });

  const removeImage = async () => {
    if (!value) return;

    const supabase = createClient();
    await supabase.storage.from(bucket).remove([value]);
    onChange(null);
  };

  // Log pour débugger l'affichage de l'image
  console.log("🖼️ [ImageUpload] value:", value);
  console.log("🖼️ [ImageUpload] bucket:", bucket);
  console.log(
    "🖼️ [ImageUpload] SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  const imageUrl = value
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${value}`
    : null;

  console.log("🖼️ [ImageUpload] Final imageUrl:", imageUrl);

  // Mode Cropper
  if (imageToCrop) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-bordeaux/20 bg-black">
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            minZoom={0.5}
            maxZoom={3}
            zoomSpeed={0.1}
            restrictPosition={false}
            objectFit="contain"
          />
        </div>

        {/* Contrôles */}
        <div className="space-y-4">
          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-bordeaux flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Zoom
              </label>
              <span className="text-xs text-bordeaux/60">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-bordeaux/50" />
              <Slider
                value={[zoom]}
                onValueChange={(values) => setZoom(values[0])}
                min={0.5}
                max={3}
                step={0.05}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-bordeaux/50" />
            </div>
          </div>

          {/* Rotation */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-bordeaux">
              Rotation
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              {rotation}°
            </Button>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleCropConfirm}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Envoi..." : "Valider"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetCropper}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-bordeaux/20">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          {/* Boutons sur l'image */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleEditExisting}
              type="button"
              className="rounded-full bg-bordeaux p-2 text-white hover:bg-bordeaux/90 transition-colors"
              title="Recadrer"
            >
              <Crop className="h-4 w-4" />
            </button>
            <button
              onClick={removeImage}
              type="button"
              className="rounded-full bg-destructive p-2 text-white hover:bg-destructive/90 transition-colors"
              title="Supprimer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isDragActive
              ? "border-bordeaux bg-bordeaux/5"
              : "border-bordeaux/30 hover:border-bordeaux/50",
            isUploading && "pointer-events-none opacity-50",
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-bordeaux/50" />
          ) : (
            <>
              <Crop className="h-10 w-10 text-bordeaux/50" />
              <p className="mt-2 text-center font-montserrat text-sm text-bordeaux/70">
                {isDragActive
                  ? "Déposez l'image ici"
                  : "Glissez une image ou cliquez pour sélectionner"}
              </p>
              <p className="text-xs text-bordeaux/50">
                JPG, PNG ou WebP • Recadrage & rotation disponibles
              </p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
