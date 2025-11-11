   using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;


namespace Core.Specifications
{


public static class ExpressionUtils
{
    public static Expression<Func<T, object>> BuildThenInclude<T, TPreviousProperty, TProperty>(Expression<Func<T, IEnumerable<TPreviousProperty>>> navigationPropertyPath, Expression<Func<TPreviousProperty, TProperty>> thenIncludeExpression)
    {
        var parameter = navigationPropertyPath.Parameters[0];
        var body = ReplacingExpressionVisitor.Replace(thenIncludeExpression.Parameters.Single(), parameter, thenIncludeExpression.Body);
        var lambda = Expression.Lambda(body, parameter);
        return (Expression<Func<T, object>>)lambda;
    }

    private class ReplacingExpressionVisitor : ExpressionVisitor
    {
        private readonly Expression _searchFor;
        private readonly Expression _replaceWith;

        private ReplacingExpressionVisitor(Expression searchFor, Expression replaceWith)
        {
            _searchFor = searchFor;
            _replaceWith = replaceWith;
        }

        public static Expression Replace(Expression searchFor, Expression replaceWith, Expression source)
        {
            return new ReplacingExpressionVisitor(searchFor, replaceWith).Visit(source);
        }

        public override Expression Visit(Expression node)
        {
            return node == _searchFor ? _replaceWith : base.Visit(node);
        }
    }
}

}