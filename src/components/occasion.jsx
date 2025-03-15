import useHomes from "../hooks/useHome"

export const GiftsForOccasions = () => {
  const {occasion,loading,error} = useHomes();
  console.log(occasion?.[0]?.["occasionName"].length)

  return (
    <>
      {occasion?.[0]?.["occasionName"].length!==0 &&
      <div className="ml-20">
        <h2 className="text-2xl font-serif italic mb-6">Gifts for Occasions</h2>
        <div className="flex">
          {occasion?.[0]?.["occasionName"].map((name, index) => (
              <div key={index} className="relative group cursor-pointer overflow-hidden rounded-2xl mr-4">
                <img src={occasion?.[0]?.occasionImages[index]} alt={name} className="w-[27.43rem] h-[30rem] object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/80 via-white/50 to-white/10 flex justify-center items-center">
                  <h3 className="text-black text-xl font-semibold drop-shadow-md">{name}</h3>
                </div>
              </div>
          ))}
        </div>
      </div>}
    </>
  )
}