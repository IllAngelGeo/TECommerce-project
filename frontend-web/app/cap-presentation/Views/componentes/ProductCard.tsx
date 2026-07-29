interface ProductCardProps {
  name: string;
  model: string;
  price: number;
  priceOffer?: number;
  image: string;
}

export default function ProductCard({ name, model, price, priceOffer, image }: ProductCardProps) {
  const tieneOferta = priceOffer !== undefined && priceOffer !== null && priceOffer > 0;
  const precioFinal = tieneOferta ? priceOffer : price;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4 flex flex-col justify-between group hover:border-zinc-700 transition-all w-full">
      
      {/* Contenedor de la Imagen */}
      <div className="aspect-square w-full bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center mb-3 relative">
        <img 
          src={image} 
          alt={name}
          className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Textos del Producto */}
      <div className="space-y-1 flex-grow mb-3 w-full">
        <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider truncate">
          {model || "SAMSUNG"}
        </span>
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
          {name}
        </h3>
      </div>

      {/* Precios formateados */}
      <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-800/60 w-full">
        <span className="text-base font-bold text-white whitespace-nowrap">
          ${Number(precioFinal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
        {tieneOferta && (
          <span className="text-xs text-zinc-500 line-through decoration-zinc-700 whitespace-nowrap">
            ${Number(price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>

    </div>
  );
}
