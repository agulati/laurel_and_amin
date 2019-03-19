Rails.application.routes.draw do
  resources :photos, only: [:index, :show, :create, :new]

  root to: "photos#index"
end
