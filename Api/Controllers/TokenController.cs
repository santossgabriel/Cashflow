using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Cashflow.Api.Auth;
using Cashflow.Api.Infra;
using Cashflow.Api.Models;
using Cashflow.Api.Shared;
using Microsoft.AspNetCore.Mvc;

namespace Cashflow.Api.Controllers
{
  /// <summary>
  /// Token
  /// </summary>
  [Route("api/token")]
  public class TokenController : Controller
  {
    private AppDbContext _context;
    private AppConfiguration _config;

    /// <summary>
    /// Constructor
    /// </summary>
    public TokenController(AppDbContext context, AppConfiguration config)
    {
      _context = context;
      _config = config;
    }

    /// <summary>
    /// Obter o token
    /// </summary>
    /// <response code="500">Erro interno no servidor</response>
    /// <response code="401">Não autorizado</response>
    [HttpPost]
    public IActionResult Post([FromBody]LoginModel model)
    {
      if (model is null || string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
        return Unauthorized();

      var user = _context.User.FirstOrDefault(p => p.Email == model.Email);
      if (user == null || user.Password != Utils.Sha1(model.Password))
        return Unauthorized();

      var claims = new Dictionary<string, string>();
      claims.Add(ClaimTypes.Sid, user.Id.ToString());
      var token = new JwtTokenBuilder(_config.JwtKey, claims).Build();
      return Ok(new { token = token.Value });
    }
  }
}