Rails.application.routes.draw do
  resources :media, only: [:index, :show, :create, :new]

  root to: "media#index"
end
