// src/pages/DetailPage/index.jsx
import { useParams } from 'react-router-dom';
import DetailAnime from './DetailAnime';
import DetailDonghua from './DetailDonghua';

const DetailPage = () => {
    const { category } = useParams();

    // Render component berdasarkan category
    if (category === 'anime') {
        return <DetailAnime />;
    } else if (category === 'donghua') {
        return <DetailDonghua />;
    }

    // Fallback jika category tidak dikenal
    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">Invalid Category</h2>
                <p className="text-gray-400">Category "{category}" is not supported</p>
            </div>
        </div>
    );
};

export default DetailPage;
