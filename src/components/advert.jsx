export const Advert = ({ image }) => {
    return (
      <div className="w-full">
        <div className="h-56 w-full bg-[#D9D9D9] mt-12 rounded-2xl">
          <img src={image} alt="image advert" className="w-full h-56 object-cover"/>
        </div>
      </div>
    );
  };