import useHomes from "../hooks/useHome"

export const GiftsForOccasions = () => {
  const {occasion, loading, error} = useHomes();
  console.log(occasion?.[0]?.["occasionName"].length)
  
  return (
    <>
      {occasion?.[0]?.["occasionName"].length !== 0 &&
      <div className="px-4 md:px-6 lg:px-8 lg:ml-12">
        <h2 className="text-xl md:text-2xl font-serif italic mb-4 md:mb-6 text-center sm:text-left">Gifts for Occasions</h2>
        <div className="grid grid-cols-1 sm:flex sm:flex-row sm:overflow-x-auto sm:gap-4 overflow-x-auto">
          {occasion?.[0]?.["occasionName"].map((name, index) => (
            <div 
              key={index} 
              className="relative group overflow-hidden rounded-2xl mb-4 sm:mb-0 sm:flex-shrink-0"
            >
              <img 
                src={occasion?.[0]?.occasionImages[index]} 
                alt={name} 
                className="w-full sm:w-60 md:w-72 lg:w-[27.5rem] h-52 sm:h-60 md:h-72 lg:h-[31rem] object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/80 via-white/50 to-white/10 flex justify-center items-center">
                <h3 className="text-black text-lg md:text-xl font-semibold drop-shadow-md px-2 text-center">{name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>}
    </>
  )
}