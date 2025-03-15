export const Advert = ({image}) => {
    return (
        <div className="mx-[4.8rem] ml-20 rounded-2xl">
            <div className="h-56 w-full bg-[#D9D9D9] mt-12 rounded-2xl">
                <img src={image} alt="image advert" className="rounded-2xl w-full h-56"/>
            </div>
        </div>
    )
}