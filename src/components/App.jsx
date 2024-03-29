import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, toast } from 'react-toastify';

import { AppBlock } from './App.styled';
import { Button } from './Button/Button';
import { Component } from 'react';
import { ImageGalleryItems } from 'components/ImageGalleryItems/ImageGalleryItems';
import { Loader } from './Loader/Loader';
import { Modal } from 'components/Modal/Modal';
import { SearchBar } from 'components/Searchbar/Searchbar';
import { fetchPage } from 'servise/fetchPage';

export class App extends Component {
  state = {
    galleryItems: [],
    page: 1,
    searchItem: '',
    visibleLoader: false,
    showModal: false,
    largeImageURL: null,
    tags: null,
  };

  async componentDidUpdate(_, prevState) {
    const { page, searchItem } = this.state;
    if (prevState.searchItem !== searchItem || prevState.page !== page) {
      this.isLoaderVisibility(true);
      await this.fetchItems(page, searchItem);
      this.isLoaderVisibility(false);
    }
  }

  fetchItems = async (page, searchItem) => {
    const { data } = await fetchPage(page, searchItem).catch(err => {
      toast.error(`Somthing went wrong :  ${err.message}`);
    });
    if (!data.hits.length) {
      toast.error('Nothing was found for your request', {
        position: 'top-center',
        autoClose: 3000,
        closeOnClick: true,
        progress: 0,
        pauseOnFocusLoss: 'false',
      });
    }
    this.setState(
      ({ galleryItems }) => ({
        galleryItems: [...galleryItems, ...data.hits],
      }),
      () => this.handleScroll(page)
    );
  };

  loadMore = () => {
    this.setState(prev => ({
      page: prev.page + 1,
    }));
  };

  isLoaderVisibility = value => {
    this.setState({ visibleLoader: value });
  };

  getLargeImage = (largeImageURL, tags) => {
    this.toggleModal();
    this.setState({ largeImageURL, tags });
  };

  toggleModal = () =>
    this.setState(({ showModal }) => ({ showModal: !showModal }));

  getSearchItem = searchItem => {
    this.setState(prev => {
      if (searchItem !== prev.searchItem)
        return { page: 1, galleryItems: [], searchItem };
    });
  };

  handleScroll = page => {
    if (page > 1) {
      window.scrollBy({
        top: 200,
        behavior: 'smooth',
      });
    }
  };

  render() {
    return (
      <AppBlock>
        <SearchBar onSubmit={this.getSearchItem} />
        {this.state.visibleLoader && <Loader />}
        {this.state.galleryItems.length !== 0 && (
          <>
            <ImageGalleryItems
              galleryItems={this.state.galleryItems}
              getLargeImage={this.getLargeImage}
            />
            <Button loadMore={this.loadMore} />
          </>
        )}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {this.state.showModal && (
          <Modal
            largeImage={this.state.largeImageURL}
            tags={this.state.tags}
            onClose={this.toggleModal}
          />
        )}
      </AppBlock>
    );
  }
}
