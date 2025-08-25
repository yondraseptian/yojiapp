import CashierInterface from '@/components/cashier-interface';
import CashierHeader from '@/layouts/app/cashier-header';

const cashier = () => {
    return (
        <div className="min-h-screen ">
            <CashierHeader />
            <main className="p-6">
                <CashierInterface />
            </main>
        </div>
    );
};

export default cashier;
