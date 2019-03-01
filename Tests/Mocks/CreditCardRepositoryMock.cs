using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using FinanceApi.Infra.Entity;
using FinanceApi.Infra.Repository;

namespace Cashflow.Tests.Mocks
{
  public class CreditCardRepositoryMock : BaseRepositoryMock, ICreditCardRepository
  {
    public void Add(CreditCard t) => CreditCards.Add(t);

    public List<CreditCard> GetAll() => CreditCards;

    public CreditCard GetById(int id) => CreditCards.FirstOrDefault(p => p.Id == id);

    public List<CreditCard> GetByUserId(int userId) => CreditCards.Where(p => p.UserId == userId).ToList();

    public List<CreditCard> GetSome(Expression<Func<CreditCard, bool>> expressions)
    {
      throw new NotImplementedException();
    }

    public bool HasPayments(int cardId) => Payments.Any(p => p.CreditCardId == cardId);

    public void Remove(int id)
    {
      var card = CreditCards.FirstOrDefault(p => p.Id == id);
      if (card != null)
        CreditCards.Remove(card);
    }

    public void Update(CreditCard t)
    {
      var card = CreditCards.FirstOrDefault(p => p.Id == t.Id);
      if (card != null)
        card.Name = t.Name;
    }

    public void Save() { }
  }
}