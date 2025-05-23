import { useState, useEffect } from "react";
import axios from "axios";
import { CustomButton } from "../components/button";
import { Card } from "../components/card";
import { Add } from "../components/add";
import { BACKEND_URL } from "../Url";

export function CreatorPage() {
    const [showAddCreator, setShowAddCreator] = useState(false);
    const [creators, setCreators] = useState([]);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        const token = localStorage.getItem("authToken"); // Fetch token inside the function

        try {
            const response = await axios.get(`${BACKEND_URL}content_creator/content_creator`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCreators(response.data);
        } catch (error) {
            console.error("Error fetching creators:", error);
        }
    };

    const handleDelete = async (creatorId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this article?");
        if (!confirmDelete) return;
        const token = localStorage.getItem("authToken"); // Fetch token inside the function

        try {
            await axios.delete(`${BACKEND_URL}content_creator/content_creator_delete/${creatorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchCreators();
        } catch (error) {
            console.error("Error deleting creator:", error);
        }
    };

    return (
        <div>
            <div className="bg-custom-light">
                <div className="absolute left-1 right-2 top-2 bottom-4 bg-[#F8F8F8] rounded-2xl h-[100vh] shadow-md ml-64">
                    <div className="text-2xl font-semibold mt-12">
                        <div className="flex justify-between">
                            <p className="ml-6">
                                <span className="text-[#151445]">Creator List</span>
                            </p>
                            <CustomButton
                                variant="primary"
                                text="Add Creator"
                                size="custom"
                                onClick={() => setShowAddCreator(true)}
                            />
                        </div>
                        <hr className="mt-4 border m-8" />
                    </div>

                    {showAddCreator ? (
                        <div className="flex justify-center items-center mt-6">
                            <Add name="Creator" role="Creator" onClose={() => setShowAddCreator(false)} fetch={fetchCreators} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 ml-6 mr-6 max-h-[80vh] overflow-y-auto">
                            {creators.map((creator) => (
                                <Card
                                    key={creator.id}
                                    profileImage="src/icons/OIP.jpeg"
                                    name={creator.name}
                                    email={creator.email}
                                    userid={creator.id}
                                    date={creator.createdAt ? new Date(creator.createdAt).toISOString().split('T')[0] : 'N/A'}
                                    onClick={() => handleDelete(creator.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
