namespace Core.Specifications
{
    public class ParentSpecParams
    {
        private const int MaxPageSize = 50;
        public int PageIndex {get;set;}=1;

        private int _pageSize =8;

        public int PageSize {
            get=> _pageSize;
            set => _pageSize =(value > MaxPageSize)? MaxPageSize:value;

        }

        public int? NumberOfChlidern {get;set;}
        //  public int? AddressId {get;set;}
         public string  sort {get;set;}
          private string  _search {get;set;}
          public string Search {
              get => _search;
              set=> _search =value.ToLower();
          }

    }
}