using System.Collections.Generic;
using System.Threading.Tasks;
using Cashflow.Api.Infra.Entity;

namespace Cashflow.Api.Infra.Repository
{
    public interface IPaymentRepository : IRepository<Payment>
    {
        Task<IEnumerable<Payment>> GetByUser(int userId);

        Task<IEnumerable<PaymentType>> GetTypes();

        System.DateTime CurrentDate { get; }
    }
}