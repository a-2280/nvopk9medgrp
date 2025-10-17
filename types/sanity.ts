export interface Dog {
  _id: string;
  k9: string;
  officer: string;
  images: Array<{
    asset: {
      _id: string;
      url: string;
    };
  }>;
}
