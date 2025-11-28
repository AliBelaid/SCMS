import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VexRoutes } from 'src/@vex/interfaces/vex-route.interface';
import { UserDetalisComponent } from './user-detalis/user-detalis.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditUserComponent } from './edit-user/edit-user.component';
 

const routes: VexRoutes = [

  {
    path: '',
    component: UserProfileComponent,

    children: [

      {path:'details' , component:UserDetalisComponent},
      // {path:'timeline',component:ContactsTableComponent} ,

    ]

  }


];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
