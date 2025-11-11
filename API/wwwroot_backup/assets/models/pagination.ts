import { Parent } from './parent';

export interface IPagination {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Parent[];
}
export class ParentParams {
  NumberOfChlidern =0;
  sort= 'last_login';
  pageNumber=1;
  pageSize= 6;
  search!: string;
}
export class SiteParams {
 cityId :string;
 siteTypeId  :string;
 siteVender  :string;
 isContract:number;
  sort= 'desc';
  pageNumber=1;
  pageSize= 12;
  search!: string;
  ra= 0;
  electricityAccount=  'all';

}
