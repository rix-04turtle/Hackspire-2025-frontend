import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Leaf } from 'lucide-react'

const CropInfoCard = ({ analysis }) => (
    <Card className="border-green-200 bg-white">
        <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Current Crop Analysis
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-600 font-medium">Crop Type</p>
                    <p className="text-gray-800">{analysis.cropName}</p>
                </div>
                <div>
                    <p className="text-gray-600 font-medium">Health Status</p>
                    <p className="text-gray-800">{analysis.healthStatus}</p>
                </div>
                <div>
                    <p className="text-gray-600 font-medium">Confidence</p>
                    <p className="text-gray-800">{analysis.confidence}</p>
                </div>
                <div>
                    <p className="text-gray-600 font-medium">Mode</p>
                    <p className="text-gray-800">Voice Only</p>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default CropInfoCard
