import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const ExampleQuestionsCard = () => (
    <Card className="mt-6 border-green-200 bg-green-50">
        <CardHeader>
            <CardTitle className="text-md text-green-800">Example Questions</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2 text-sm text-green-700">
                <li>• "What treatment should I apply for this disease?"</li>
                <li>• "How can I prevent this problem in future?"</li>
                <li>• "When should I harvest this crop?"</li>
                <li>• "What fertilizer is best for this crop?"</li>
                <li>• "How much water does this crop need?"</li>
            </ul>
        </CardContent>
    </Card>
)

export default ExampleQuestionsCard
